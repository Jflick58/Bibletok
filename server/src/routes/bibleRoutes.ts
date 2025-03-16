import { Router } from 'express';
import * as bibleController from '../controllers/bibleController';

const router = Router();

// Bible endpoints
router.get('/bibles', bibleController.getAllBibles);
router.get('/bibles/:bibleId', bibleController.getBible);

// Verse endpoints
router.get('/verses/:bibleId', bibleController.getVerses);
router.get('/verses/:bibleId/after/:verseId', bibleController.getVersesAfter);
router.get('/verses/:bibleId/before/:verseId', bibleController.getVersesBefore);

export default router;