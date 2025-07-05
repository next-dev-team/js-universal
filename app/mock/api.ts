import type { Request, Response } from '@liangskyli/mock';

export default {
  // 支持值为 Object 和 Array
  'GET /test1/get-list': {
    code: 0,
    data: { name: 'name' },
    message: 'message',
  },

  // 支持自定义函数
  'GET /test1/get-list2': (_req: Request, res: Response) => {
    // 添加跨域请求头
    res.setHeader('Access-Control-Allow-Origin', '*');
    const data = { code: 0, data: { name: 'name' }, message: 'message' };
    res.json(data);
  },
};
