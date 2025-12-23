const Participant = require('../models/Participant');
const CollectiveHub = require('../models/CollectiveHub');

/**
 * ParticipantService
 * Handles business logic for user/participant operations
 */

class ParticipantService {
  
  async registerNewParticipant(displayName, contactInfo) {
    // Check if contact already exists
    const existing = await Participant.findOne({ contactInfo });
    if (existing) {
      throw new Error('A participant with this contact info already exists');
    }
    
    const newParticipant = new Participant({
      displayName,
      contactInfo,
      associatedGroups: []
    });
    
    await newParticipant.save();
    return newParticipant;
  }
  
  async findParticipantById(participantId) {
    const participant = await Participant.findById(participantId)
      .populate('associatedGroups');
    
    if (!participant) {
      throw new Error('Participant not found');
    }
    
    return participant;
  }
  
  async findParticipantByContact(contactInfo) {
    return await Participant.findOne({ contactInfo });
  }
  
  async listAllParticipants() {
    return await Participant.find().select('displayName contactInfo recordCreatedAt');
  }
  
  async updateParticipantInfo(participantId, updates) {
    const allowed = ['displayName', 'contactInfo'];
    const filtered = {};
    
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }
    
    const updated = await Participant.findByIdAndUpdate(
      participantId,
      filtered,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      throw new Error('Participant not found');
    }
    
    return updated;
  }
}

module.exports = new ParticipantService();
