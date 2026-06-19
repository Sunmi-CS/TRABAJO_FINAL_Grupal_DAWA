import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, updateUserRole, uploadAvatar } from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { uploadAvatarPhoto } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireAdmin, getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/role', requireAdmin, updateUserRole);
router.post('/:id/avatar', uploadAvatarPhoto, uploadAvatar);

export default router;
