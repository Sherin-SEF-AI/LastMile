import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for simulation data
  
  // Get all responders
  app.get('/api/responders', async (req, res) => {
    try {
      const allResponders = await storage.getAllResponders();
      res.json(allResponders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch responders' });
    }
  });

  // Get nearby responders based on distance
  app.get('/api/responders/nearby', async (req, res) => {
    try {
      const maxDistance = parseInt(req.query.distance as string) || 500;
      const nearbyResponders = await storage.getNearbyResponders(maxDistance);
      res.json(nearbyResponders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch nearby responders' });
    }
  });

  // Get all safe havens
  app.get('/api/safe-havens', async (req, res) => {
    try {
      const allSafeHavens = await storage.getAllSafeHavens();
      res.json(allSafeHavens);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch safe havens' });
    }
  });

  // Get journey safety score
  app.get('/api/journey/safety-score', async (req, res) => {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const transportMode = req.query.mode as string;
      
      if (!from || !to || !transportMode) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const safetyData = await storage.getJourneySafetyScore(from, to, transportMode);
      res.json(safetyData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to calculate safety score' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
