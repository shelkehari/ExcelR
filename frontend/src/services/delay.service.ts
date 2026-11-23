import api from './api'
import type { DelayPrediction } from '../types'

export const delayService = {
  predict: (projectId: number) =>
    api.get<DelayPrediction>(`/delay-prediction/projects/${projectId}`).then(r => r.data),
}
