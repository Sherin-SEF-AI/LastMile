import { users, type User, type InsertUser, type Responder, type SafeHaven } from "@shared/schema";

// Extend the storage interface with simulation-specific methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Simulation-specific methods
  getAllResponders(): Promise<Responder[]>;
  getNearbyResponders(maxDistance: number): Promise<Responder[]>;
  getAllSafeHavens(): Promise<SafeHaven[]>;
  getJourneySafetyScore(from: string, to: string, transportMode: string): Promise<{
    score: number;
    rating: string;
    safeHavensCount: number;
    responderCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private responders: Responder[];
  private safeHavens: SafeHaven[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Simulate some responders data
    this.responders = [
      {
        id: 1,
        name: "Rahul Mehta",
        skills: ["First Aid", "Security"],
        location: "Near ITPL Main Road",
        distance: 120,
        isAvailable: true,
        profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5"
      },
      {
        id: 2,
        name: "Ananya Patel",
        skills: ["First Aid", "Medical"],
        location: "Whitefield",
        distance: 250,
        isAvailable: true,
        profileImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
      },
      {
        id: 3,
        name: "Suresh Kumar",
        skills: ["Security", "Driver"],
        location: "Hoodi Circle",
        distance: 350,
        isAvailable: true,
        profileImage: "https://images.unsplash.com/photo-1500048993953-d23a436266cf"
      }
    ];
    
    // Simulate some safe havens data
    this.safeHavens = [
      {
        id: 1,
        name: "Sapphire Mall",
        type: "Shopping Mall",
        location: "Whitefield",
        isActive: true
      },
      {
        id: 2,
        name: "24x7 Medical Store",
        type: "Pharmacy",
        location: "Hoodi Circle",
        isActive: true
      },
      {
        id: 3,
        name: "Baiyappanahalli Metro Station",
        type: "Public Transport",
        location: "Baiyappanahalli",
        isActive: true
      },
      {
        id: 4,
        name: "Brigade Gateway",
        type: "Apartment Complex",
        location: "Malleswaram",
        isActive: true
      },
      {
        id: 5,
        name: "Hope Farm Signal",
        type: "Police Outpost",
        location: "Hope Farm",
        isActive: true
      }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Simulation-specific methods
  async getAllResponders(): Promise<Responder[]> {
    return this.responders;
  }
  
  async getNearbyResponders(maxDistance: number): Promise<Responder[]> {
    return this.responders.filter(responder => 
      responder.isAvailable && responder.distance <= maxDistance
    );
  }
  
  async getAllSafeHavens(): Promise<SafeHaven[]> {
    return this.safeHavens;
  }
  
  async getJourneySafetyScore(
    from: string, 
    to: string, 
    transportMode: string
  ): Promise<{
    score: number;
    rating: string;
    safeHavensCount: number;
    responderCount: number;
  }> {
    // In a real implementation, this would calculate based on actual data
    // For simulation, we'll return predetermined values
    
    // Calculate nearby responders (those within 500m)
    const nearbyResponders = await this.getNearbyResponders(500);
    
    // Get all active safe havens
    const activeSafeHavens = this.safeHavens.filter(haven => haven.isActive);
    
    // Calculate safety score (simulated)
    let score = 87; // Default score
    
    // Adjust score based on transport mode
    if (transportMode === 'walking') {
      score -= 10; // Walking is considered less safe at night
    } else if (transportMode === 'cab') {
      score += 5; // Cabs might be considered safer
    }
    
    // Adjust score based on responder count
    score += Math.min(nearbyResponders.length * 2, 10);
    
    // Adjust score based on safe haven count
    score += Math.min(activeSafeHavens.length, 5);
    
    // Cap score at 100
    score = Math.min(score, 100);
    
    // Determine rating
    let rating;
    if (score >= 90) {
      rating = "Excellent";
    } else if (score >= 80) {
      rating = "Good";
    } else if (score >= 70) {
      rating = "Moderate";
    } else if (score >= 60) {
      rating = "Caution";
    } else {
      rating = "High Risk";
    }
    
    return {
      score,
      rating,
      safeHavensCount: activeSafeHavens.length,
      responderCount: nearbyResponders.length
    };
  }
}

export const storage = new MemStorage();
