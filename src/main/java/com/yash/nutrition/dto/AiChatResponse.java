package com.yash.nutrition.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiChatResponse {
    private boolean success;
    private String response;
    private String reply; // For backward compatibility with older frontends
    private Integer tokensUsed;
    private String message;
    private String error;

    public AiChatResponse() {}

    public AiChatResponse(String reply) {
        this.success = true;
        this.response = reply;
        this.reply = reply;
    }

    public static AiChatResponse success(String response, int tokens) {
        AiChatResponse res = new AiChatResponse();
        res.success = true;
        res.response = response;
        res.reply = response;
        res.tokensUsed = tokens;
        return res;
    }

    public static AiChatResponse error(String message, String errorDetail) {
        AiChatResponse res = new AiChatResponse();
        res.success = false;
        res.message = message;
        res.error = errorDetail;
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public Integer getTokensUsed() { return tokensUsed; }
    public void setTokensUsed(Integer tokensUsed) { this.tokensUsed = tokensUsed; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
