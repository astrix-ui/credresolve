const participantService = require('../services/participantService');

/**
 * ParticipantController
 * Handles HTTP requests for participant operations
 */

class ParticipantController {
  
  async createUser(req, res) {
    try {
      const { displayName, contactInfo } = req.body;
      
      if (!displayName || !contactInfo) {
        return res.status(400).json({
          success: false,
          message: 'displayName and contactInfo are required'
        });
      }
      
      const participant = await participantService.registerNewParticipant(
        displayName, 
        contactInfo
      );
      
      res.status(201).json({
        success: true,
        message: 'Participant registered successfully',
        data: participant
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      
      const participant = await participantService.findParticipantById(userId);
      
      res.status(200).json({
        success: true,
        data: participant
      });
      
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getAllUsers(req, res) {
    try {
      const participants = await participantService.listAllParticipants();
      
      res.status(200).json({
        success: true,
        count: participants.length,
        data: participants
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const updated = await participantService.updateParticipantInfo(userId, updates);
      
      res.status(200).json({
        success: true,
        message: 'Participant updated successfully',
        data: updated
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ParticipantController();
