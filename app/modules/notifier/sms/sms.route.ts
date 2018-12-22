import NotifierListener from './sms.controller';
import { IRoute, IRouteConfig, HttpMethods, AuthStrategies } from '../../../interfaces/utils/Route';

class NotifierRoute implements IRoute {
  public basePath = '/notify/sms';
  public controller = new NotifierListener();

  public getServerRoutes(): IRouteConfig[] {
    return [
      {
        method: HttpMethods.POST,
        auth: AuthStrategies.PUBLIC,
        handler: this.controller.post,
      }
    ];
  }
}

export default NotifierRoute;
