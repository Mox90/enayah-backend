import { Request, Response } from 'express'
import { updatePIPProgress } from './pip.service'

export const updatePIPController = async (req: Request, res: Response) => {
  try {
    const appraisalId = Array.isArray(req.params.appraisalId)
      ? req.params.appraisalId[0]
      : req.params.appraisalId

    if (!appraisalId) {
      return res.status(400).json({
        success: false,
        message: 'Appraisal ID is required',
      })
    }
    const { progress, managerComments, status } = req.body

    const result = await updatePIPProgress(appraisalId, {
      progress,
      managerComments,
      status,
    })

    return res.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}
