const CollectiveHub = require('../models/CollectiveHub');
const Participant = require('../models/Participant');

/**
 * HubService
 * Manages group/hub operations
 */

class HubService {
  
  async establishNewHub(hubName, hubDescription, creatorId, initialMembers = []) {
    // Verify creator exists
    const creator = await Participant.findById(creatorId);
    if (!creator) {
      throw new Error('Creator participant not found');
    }
    
    // Always include creator in members
    const memberSet = new Set(initialMembers.map(id => id.toString()));
    memberSet.add(creatorId.toString());
    
    const membersList = Array.from(memberSet).map(id => ({
      participantRef: id,
      joinedOn: new Date(),
      isActive: true
    }));
    
    const newHub = new CollectiveHub({
      hubName,
      hubDescription,
      membersList,
      createdBy: creatorId
    });
    
    await newHub.save();
    
    // Update each participant's associatedGroups
    await Participant.updateMany(
      { _id: { $in: Array.from(memberSet) } },
      { $addToSet: { associatedGroups: newHub._id } }
    );
    
    return newHub;
  }
  
  async findHubById(hubId) {
    const hub = await CollectiveHub.findById(hubId)
      .populate('membersList.participantRef')
      .populate('createdBy');
    
    if (!hub) {
      throw new Error('Hub not found');
    }
    
    return hub;
  }
  
  async addMemberToHub(hubId, participantId) {
    const hub = await CollectiveHub.findById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }
    
    const participant = await Participant.findById(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }
    
    // Check if already a member
    const alreadyMember = hub.membersList.some(
      m => m.participantRef.toString() === participantId.toString()
    );
    
    if (alreadyMember) {
      throw new Error('Participant is already a member of this hub');
    }
    
    hub.membersList.push({
      participantRef: participantId,
      joinedOn: new Date(),
      isActive: true
    });
    
    await hub.save();
    
    // Update participant's group list
    await Participant.findByIdAndUpdate(
      participantId,
      { $addToSet: { associatedGroups: hubId } }
    );
    
    return hub;
  }
  
  async removeMemberFromHub(hubId, participantId) {
    const hub = await CollectiveHub.findById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }
    
    // Mark as inactive instead of deleting for data integrity
    const memberIndex = hub.membersList.findIndex(
      m => m.participantRef.toString() === participantId.toString()
    );
    
    if (memberIndex === -1) {
      throw new Error('Participant is not a member of this hub');
    }
    
    hub.membersList[memberIndex].isActive = false;
    await hub.save();
    
    return hub;
  }
  
  async listHubsForParticipant(participantId) {
    const hubs = await CollectiveHub.find({
      'membersList.participantRef': participantId,
      'membersList.isActive': true
    }).populate('createdBy').select('hubName hubDescription establishedAt');
    
    return hubs;
  }
}

module.exports = new HubService();
