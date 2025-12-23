const hubService = require('../services/hubService');

/**
 * HubController
 * Manages HTTP requests for group/hub operations
 */

class HubController {
  
  async createGroup(req, res) {
    try {
      const { hubName, hubDescription, creatorId, members } = req.body;
      
      if (!hubName || !creatorId) {
        return res.status(400).json({
          success: false,
          message: 'hubName and creatorId are required'
        });
      }
      
      const hub = await hubService.establishNewHub(
        hubName,
        hubDescription || '',
        creatorId,
        members || []
      );
      
      res.status(201).json({
        success: true,
        message: 'Hub created successfully',
        data: hub
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getGroupDetails(req, res) {
    try {
      const { hubId } = req.params;
      
      const hub = await hubService.findHubById(hubId);
      
      res.status(200).json({
        success: true,
        data: hub
      });
      
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async addMember(req, res) {
    try {
      const { hubId } = req.params;
      const { participantId } = req.body;
      
      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'participantId is required'
        });
      }
      
      const hub = await hubService.addMemberToHub(hubId, participantId);
      
      res.status(200).json({
        success: true,
        message: 'Member added successfully',
        data: hub
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async removeMember(req, res) {
    try {
      const { hubId } = req.params;
      const { participantId } = req.body;
      
      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'participantId is required'
        });
      }
      
      const hub = await hubService.removeMemberFromHub(hubId, participantId);
      
      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: hub
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getUserGroups(req, res) {
    try {
      const { userId } = req.params;
      
      const hubs = await hubService.listHubsForParticipant(userId);
      
      res.status(200).json({
        success: true,
        count: hubs.length,
        data: hubs
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HubController();
