import { AppError } from '../../utils/AppError'
import { asyncHandler } from '../../utils/asyncHandler'
import { successResponse } from '../../utils/response'
import * as service from './employeeAppraisals.service'
import * as appraisalService from '../appraisalCycles/appraisal.service'
import { Request, Response } from 'express'
import { appraisalRatingLabels } from '../../utils/appraisalRating'
import { eq } from 'drizzle-orm'
import { db, employeeAppraisals } from '../../db'
import {
  appraisalFeedbackSchema,
  launchAppraisalSchema,
} from './employeeAppraisals.schema'
import { requireManager, requireHR, requireEmployee } from '../../utils/auth'
import { generateAIInsights } from '../ai/aiAppraisal.service'
import { predictRisk } from '../ai/aiRisk.service'
import {
  computeCompetenciesScore,
  computeGoalsScore,
  getCompetenciesByAppraisalId,
  getGoalsByAppraisalId,
} from '../../utils/appraisal.utils'
import { getAppraisalById } from './employeeAppraisals.service'
import { createPIP, getPIPByAppraisal } from '../pips/pip.service'

export const launchAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, cycleId } = launchAppraisalSchema.parse(req.body)

    const appraiserId = requireManager(req)

    const result = await service.launchAppraisal(
      employeeId,
      appraiserId,
      cycleId,
    )

    return successResponse(res, result, 'Appraisal launched')
  },
)

export const submitPlanningController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.submitPlanning(id, managerId)

    return successResponse(res, result, 'Planning submitted')
  },
)

export const acknowledgeAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const employeeId = requireEmployee(req)

    const result = await service.acknowledgeAppraisal(id, employeeId)

    return successResponse(res, result, 'Appraisal acknowledged')
  },
)

export const submitAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.submitAppraisal(id, managerId)

    const label = appraisalRatingLabels[result.overallRating]

    return successResponse(
      res,
      {
        ...result,
        overallRatingLabel: label,
      },
      'Appraisal submitted',
    )
  },
)

export const approveAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const hrId = requireHR(req)

    const result = await service.approveAppraisal(id, hrId)

    return successResponse(res, result, 'Appraisal approved by HR')
  },
)

export const rejectAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const employeeId = requireEmployee(req)

    const { reason } = req.body

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400)
    }

    const result = await service.rejectAppraisal(id, employeeId!, reason.trim())

    return successResponse(res, result, 'Appraisal rejected')
  },
)

export const reopenAppraisalController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!id) throw new AppError('Appraisal ID required', 400)

    const managerId = requireManager(req)

    const result = await service.reopenAppraisal(id, managerId!)

    return successResponse(res, result, 'Appraisal reopened')
  },
)

export const updateFeedbackController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = appraisalFeedbackSchema.parse(req.body)

    const { appraisalId, strengths, developmentAreas, comments } = data

    const payload: {
      strengths: string[]
      developmentAreas: string[]
      comments?: string
    } = {
      strengths,
      developmentAreas,
    }

    if (comments !== undefined) {
      payload.comments = comments
    }

    const result = await service.updateAppraisalFeedback(appraisalId, payload)

    return successResponse(res, result, 'Feedback updated')
  },
)

export const generateFeedbackController = async (
  req: Request,
  res: Response,
) => {
  //try {
  //console.log('🔥 CONTROLLER HIT')
  //console.log('QUERY:', req.query)

  //const { id } = req.params
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) throw new AppError('Appraisal ID required', 400)
  // 🔹 1. Fetch appraisal
  const appraisal = await getAppraisalById(id)

  if (!appraisal) {
    return res.status(404).json({
      success: false,
      message: 'Appraisal not found',
    })
  }

  // ✅ 🔥 2. PREVENT duplicate AI calls (PUT HERE)
  const force = req.query.force === 'true'
  console.log('FORCE:', force)
  console.log(
    'BLOCK CONDITION:',
    !force &&
      appraisal.strengths &&
      appraisal.developmentAreas &&
      appraisal.pip,
  )
  if (
    !force &&
    appraisal.strengths &&
    appraisal.developmentAreas &&
    appraisal.pip
  ) {
    return res.json({
      success: true,
      message: 'Feedback already generated',
    })
  }

  // 🔹 3. Fetch related data
  const goals = await getGoalsByAppraisalId(id)
  const competencies = await getCompetenciesByAppraisalId(id)

  // 🔹 4. Compute scores
  const goalsScore = computeGoalsScore(goals)
  const competenciesScore = computeCompetenciesScore(competencies)
  //const finalScore = (goalsScore + competenciesScore) / 2

  const cycle = await appraisalService.getCycleById(appraisal.cycleId)

  // fallback if missing
  //const goalsWeight = Number(cycle?.goalsWeight ?? 0.5)
  //const competenciesWeight = Number(cycle?.competenciesWeight ?? 0.5)
  const goalsWeight = Number(cycle?.goalsWeight ?? 50) / 100
  const competenciesWeight = Number(cycle?.competenciesWeight ?? 50) / 100
  const finalScore =
    goalsScore * goalsWeight + competenciesScore * competenciesWeight

  console.log({
    goalsScore,
    competenciesScore,
  })

  const formattedGoals = goals.map((g: any) => ({
    title: g.title,
    rating: g.fulfillmentRating,
  }))

  const formattedCompetencies = competencies.map((c: any) => ({
    name: c.competency?.name || 'Unknown competency',
    rating: c.fulfillmentRating,
  }))

  // 🔹 5. Risk detection
  const risk = predictRisk({ goals, competencies })

  /*const confidenceScore = Number(
      (
        (goals.filter((g: any) => g.fulfillmentRating != null).length +
          competencies.filter((c: any) => c.fulfillmentRating != null).length) /
        (goals.length + competencies.length)
      ).toFixed(2),
    )*/

  const totalItems = goals.length + competencies.length
  const ratedItems =
    goals.filter((g: any) => g.fulfillmentRating != null).length +
    competencies.filter((c: any) => c.fulfillmentRating != null).length
  const confidenceScore =
    totalItems > 0 ? Number((ratedItems / totalItems).toFixed(2)) : 0

  // 🔹 6. Build AI payload
  const payload = {
    employee: appraisal.employeeNameSnapshot,
    jobTitle: appraisal.jobTitleSnapshot,
    department: appraisal.departmentSnapshot,
    goals: formattedGoals,
    competencies: formattedCompetencies,
    finalScore,
    riskLevel: risk.riskLevel,
    riskScore: risk.riskScore,
    riskReasons: risk.reasons,
  }

  // ✅ 🔥 7. AI CALL (PUT TRY/CATCH HERE)
  let aiResponse

  try {
    aiResponse = await generateAIInsights(payload)
  } catch (error: any) {
    console.error('AI ERROR:', error?.message)

    return res.status(500).json({
      success: false,
      message: 'AI service unavailable or quota exceeded',
    })
  }

  // 🔥 ADD IT HERE (RIGHT AFTER AI RESPONSE)
  aiResponse = ensurePIP(aiResponse)

  await db.transaction(async (tx) => {
    const existingPIP = await getPIPByAppraisal(id)

    if (!existingPIP && aiResponse.needsPIP && aiResponse.pip) {
      const pip = aiResponse.pip

      const objectives = pip.objectives.join('\n')
      const actionPlan = pip.actions.join('\n')
      const successCriteria = pip.successMetrics.join('\n')

      const level = risk.riskLevel === 'high' ? 'critical' : 'moderate'

      const durationDays = parseInt(pip.timeline, 10) || 60

      await createPIP(tx, {
        appraisalId: id,
        objectives,
        actionPlan,
        successCriteria,
        level,
        durationDays,
      })
    }

    await tx
      .update(employeeAppraisals)
      .set({
        strengths: aiResponse.strengths,
        developmentAreas: aiResponse.developmentAreas,
        comments: aiResponse.needsPIP
          ? 'Recommended for Performance Improvement Plan (PIP)'
          : 'Satisfactory performance',
        pip: aiResponse.needsPIP ? aiResponse.pip : null,
        updatedAt: new Date(),
      })
      .where(eq(employeeAppraisals.id, id))
  })

  // 🔹 9. Return response
  return res.json({
    success: true,
    data: {
      finalScore,
      riskLevel: risk.riskLevel,
      confidenceScore,
      insights: aiResponse,
    },
  })
  /*} catch (error) {
    console.error('CONTROLLER ERROR:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }*/
}

const ensurePIP = (aiResponse: any) => {
  if (aiResponse.needsPIP && !aiResponse.pip) {
    return {
      ...aiResponse,
      pip: {
        objectives: ['Improve performance in key areas'],
        actions: ['Follow supervisor guidance'],
        timeline: '60 days',
        successMetrics: ['Meet expected performance standards'],
      },
    }
  }
  return aiResponse
}
