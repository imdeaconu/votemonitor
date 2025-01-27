﻿using SubmissionsFaker.Clients.Models;
using SubmissionsFaker.Clients.Models.Questions;

namespace SubmissionsFaker.Clients.NgoAdmin.Models;

public class UpdateFormResponse : CreateResponse
{
    public Guid Id { get; set; }
    public List<BaseQuestionRequest> Questions { get; set; } = new();
}