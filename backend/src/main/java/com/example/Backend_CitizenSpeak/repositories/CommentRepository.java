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
    List<Comment> findByCitizenOrderByCommentDateAsc(Citizen citizen);
    List<Comment> findByAuthorTypeAndCitizenOrderByCommentDateAsc(String authorType, Citizen citizen);
    List<Comment> findByAgentOrderByCommentDateAsc(CommunityAgent agent);
    List<Comment> findByAuthorTypeAndAgentOrderByCommentDateAsc(String authorType, CommunityAgent agent);

    List<Comment> findByAuthorTypeOrderByCommentDateAsc(String authorType);
    List<Comment> findByComplaintAndAuthorTypeOrderByCommentDateAsc(Complaint complaint, String authorType);
    List<Comment> findByComplaintOrderByCommentDateDesc(Complaint complaint);
    List<Comment> findAllByOrderByCommentDateDesc();
    List<Comment> findTop20ByOrderByCommentDateDesc();
    List<Comment> findByCitizenOrderByCommentDateDesc(Citizen citizen);
    List<Comment> findByAgentOrderByCommentDateDesc(CommunityAgent agent);

    @Query("{ 'complaint.complaintId' : ?0 }")
    List<Comment> findByComplaintComplaintId(String complaintId);

    @Query(value = "{ 'complaint.complaintId' : ?0 }", sort = "{ 'commentDate' : 1 }")
    List<Comment> findByComplaintComplaintIdOrderByCommentDateAsc(String complaintId);

    @Query(value = "{ 'complaint.complaintId' : ?0 }", sort = "{ 'commentDate' : -1 }")
    List<Comment> findByComplaintComplaintIdOrderByCommentDateDesc(String complaintId);
    @Query(value = "{ 'complaint.complaintId' : ?0, 'authorType' : ?1 }", sort = "{ 'commentDate' : 1 }")
    List<Comment> findByComplaintComplaintIdAndAuthorTypeOrderByCommentDateAsc(String complaintId, String authorType);
    long countByComplaint(Complaint complaint);

    @Query(value = "{ 'complaint.complaintId' : ?0 }", count = true)
    long countByComplaintComplaintId(String complaintId);

    @Query(value = "{ 'complaint.complaintId' : ?0, 'authorType' : ?1 }", count = true)
    long countByComplaintComplaintIdAndAuthorType(String complaintId, String authorType);

    boolean existsByComplaintAndCitizen(Complaint complaint, Citizen citizen);
    boolean existsByComplaintAndAgent(Complaint complaint, CommunityAgent agent);

    @Query("{ 'complaint.complaintId' : ?0, 'citizen.$id' : ?1 }")
    boolean existsByComplaintComplaintIdAndCitizen(String complaintId, String citizenId);

    @Query("{ 'complaint.complaintId' : ?0, 'agent.$id' : ?1 }")
    boolean existsByComplaintComplaintIdAndAgent(String complaintId, String agentId);

    List<Comment> findByCommentDateGreaterThanEqualOrderByCommentDateAsc(Date date);
    List<Comment> findByCommentDateGreaterThanEqualOrderByCommentDateDesc(Date date);

    @Query("{ 'description' : { $regex: ?0, $options: 'i' } }")
    List<Comment> findByDescriptionContainingIgnoreCase(String keyword);

    @Query(value = "{ 'description' : { $regex: ?0, $options: 'i' } }", sort = "{ 'commentDate' : 1 }")
    List<Comment> findByDescriptionContainingIgnoreCaseOrderByCommentDateAsc(String keyword);

    @Query("{ 'complaint.$id' : ?0 }")
    List<Comment> findByComplaintId(String complaintId);
}