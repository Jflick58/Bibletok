import { Request, Response, NextFunction } from 'express';
import * as bibleService from '../services/bibleService';
import logger from '../utils/logger';
import { handleError } from '../utils/errors';

// Get all available Bibles
export const getAllBibles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bibles = await bibleService.getAvailableBibles();
    logger.info(`Retrieved ${bibles.length} Bibles`);
    res.json({ bibles });
  } catch (error) {
    next(error);
  }
};

// Get a specific Bible
export const getBible = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bibleId } = req.params;
    const bible = await bibleService.getBibleById(bibleId);
    logger.info(`Retrieved Bible: ${bible.name}`);
    res.json({ bible });
  } catch (error) {
    next(error);
  }
};

// Get featured verses for a Bible
export const getVerses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bibleId } = req.params;
    const verses = await bibleService.getFeaturedVerses(bibleId);
    logger.info(`Retrieved ${verses.length} featured verses for Bible ${bibleId}`);
    res.json({ verses });
  } catch (error) {
    next(error);
  }
};

// Get verses after a specific verse
export const getVersesAfter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bibleId, verseId } = req.params;
    const count = parseInt(req.query.count as string) || 5;
    
    const verses = await bibleService.getVersesAfter(bibleId, verseId, count);
    logger.info(`Retrieved ${verses.length} verses after ${verseId}`);
    res.json({ verses });
  } catch (error) {
    next(error);
  }
};

// Get verses before a specific verse
export const getVersesBefore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bibleId, verseId } = req.params;
    const count = parseInt(req.query.count as string) || 5;
    
    const verses = await bibleService.getVersesBefore(bibleId, verseId, count);
    logger.info(`Retrieved ${verses.length} verses before ${verseId}`);
    res.json({ verses });
  } catch (error) {
    next(error);
  }
};