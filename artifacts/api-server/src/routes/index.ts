import { Router, type IRouter } from "express";
import healthRouter from "./health";
import brandStoreRouter from "./brand-store";

const router: IRouter = Router();

router.use(healthRouter);
router.use(brandStoreRouter);

export default router;
