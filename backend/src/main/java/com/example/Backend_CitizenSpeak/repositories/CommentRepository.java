package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByComplaintOrderByCommentDateAsc(Complaint complaint);
    List<Comment> findAllByOrderByCommentDateAsc();

    List<Comment> findByAuthorTypeAndCitizenOrderByCommentDateAsc(String authorType, Citizen citizen);

    List<Comment> findByAuthorTypeAndAgentOrderByCommentDateAsc(String authorType, CommunityAgent agent);

    List<Comment> findByAuthorTypeOrderByCommentDateAsc(String authorType);
    List<Comment> findByComplaintAndAuthorTypeOrderByCommentDateAsc(Complaint complaint, String authorType);

    List<Comment> findTop20ByOrderByCommentDateDesc();

    @Query(value = "{ 'complaint.complaintId' : ?0 }", count = true)
    long countByComplaintComplaintId(String complaintId);

    @Query(value = "{ 'complaint.complaintId' : ?0, 'authorType' : ?1 }", count = true)
    long countByComplaintComplaintIdAndAuthorType(String complaintId, String authorType);

    @Query("{ 'complaint.complaintId' : ?0, 'citizen.$id' : ?1 }")
    boolean existsByComplaintComplaintIdAndCitizen(String complaintId, String citizenId);

    @Query("{ 'complaint.complaintId' : ?0, 'agent.$id' : ?1 }")
    boolean existsByComplaintComplaintIdAndAgent(String complaintId, String agentId);

    List<Comment> findByCommentDateGreaterThanEqualOrderByCommentDateAsc(Date date);

    @Query(value = "{ 'description' : { $regex: ?0, $options: 'i' } }", sort = "{ 'commentDate' : 1 }")
    List<Comment> findByDescriptionContainingIgnoreCaseOrderByCommentDateAsc(String keyword);
}