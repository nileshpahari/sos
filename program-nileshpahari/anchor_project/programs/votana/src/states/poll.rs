use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    pub creator: Pubkey,
    #[max_len(30)]
    pub title: String,
    #[max_len(200)]
    pub description: String,
    pub start: u64,
    pub end: u64,
    pub candidates: u64,
    pub votes: u64,
    pub allow_candidate_adding: bool, // true if only the poll creator can add candidates
    pub allow_vote_closing: bool,      // true if people can close their votes
    pub allow_candidate_withdraw: bool, // true if people can unregister candidates
}
