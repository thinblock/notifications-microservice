import { get } from 'superagent';
import { services } from '../config/env';

export const getJob = async (id: string) => {
  try {
    // const res = await get(`${services.jobs.url}/jobs/${id}?look_up=token`).send();
    // return res.body;
    return {
      notification: {
        type: 'WEBHOOK',
        value: 'http://localhost:8080/notify/5b9f976ff301d34226dd29ff'
      }
    };
  } catch (e) {
    throw e;
  }
};