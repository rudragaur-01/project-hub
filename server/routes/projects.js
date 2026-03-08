import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { projectAccess } from "../middleware/projectAccess.js"; 
import * as projectCtrl from "../controllers/projectController.js";
import * as taskCtrl from "../controllers/taskController.js";

const router = Router();
router.use(auth);

router.get("/", projectCtrl.list);
router.post("/", projectCtrl.create);

router.get("/:id/members",  projectCtrl.members);
router.post("/:id/invite", projectAccess, projectCtrl.invite);
router.patch("/:id", projectAccess, projectCtrl.update);
router.delete("/:id", projectAccess, projectCtrl.remove);
router.get("/:id", projectAccess, projectCtrl.getOne);

router.post("/:projectId/tasks", projectAccess, taskCtrl.create);
router.patch("/:projectId/tasks/:taskId", projectAccess, taskCtrl.update);

export default router;