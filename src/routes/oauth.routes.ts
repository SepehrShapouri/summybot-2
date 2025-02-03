import { Router } from 'express';
import { oauthRedirect } from '../controllers/oauth.controller';

const router = Router();

router.get('/oauth_redirect', oauthRedirect);

export default router;
