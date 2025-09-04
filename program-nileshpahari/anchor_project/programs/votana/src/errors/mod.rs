use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Poll counter cannot be less than zero")]
    PollCounterUnderflow,
    #[msg("Registrations counter cannot be less than zero")]
    RegistrationsCounterUnderflow,
    #[msg("Voter cannot vote twice")]
    VoterAlreadyVoted,
    #[msg("Candidate cannot register twice")]
    CandidateAlreadyRegistered,
    #[msg("Start date cannot be greater than end date")]
    InvalidDates,
    #[msg("Candidate is not in the poll")]
    CandidateNotRegistered,
    #[msg("Poll not currently active")]
    PollNotActive,
    #[msg("Poll does not exist or not found")]
    PollDoesNotExist,
    #[msg("Not authorized to perform this action")]
    Unauthorized,
    #[msg("Poll still active")]
    PollStillActive,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Description too long")] 
    DescriptionTooLong,
    #[msg("Title too long")] 
    TitleTooLong,
    #[msg("Votes counter underflow")]
    VotesCounterUnderflow,
    #[msg("Candidate votes underflow")]
    CandidateVotesUnderflow,
    #[msg("Voter not voted")]
    VoterNotVoted,
    #[msg("Voter candidate mismatch")]
    VoterCandidateMismatch,
    #[msg("Poll votes underflow")]
    PollVotesUnderflow,
}