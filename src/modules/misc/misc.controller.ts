import { Category, TRequest, TResponse } from "@types";

export class MiscController {
  public async getEnums(req: TRequest, res: TResponse) {
    res.status(200).send(Category);
  }
}
