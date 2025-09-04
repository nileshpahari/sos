use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::ErrorCode;

pub fn close_vote(ctx: Context<CloseVote>, poll_id: u64, cid: u64) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    let votes = &mut ctx.accounts.votes;
    let voter = &mut ctx.accounts.voter;
    let poll = &mut ctx.accounts.poll;
    let now = Clock::get()?.unix_timestamp as u64;

    // verify voter belonged to this candidate
    require!(voter.cid == candidate.cid, ErrorCode::VoterCandidateMismatch);

    require!(poll.id == poll_id, ErrorCode::PollDoesNotExist);
    require!(candidate.cid == cid, ErrorCode::CandidateNotRegistered);

    require!(voter.has_voted, ErrorCode::VoterNotVoted);

      if !poll.allow_vote_closing {
        require_keys_eq!(poll.creator, ctx.accounts.signer.key(), ErrorCode::Unauthorized);
    }
    require!(now < poll.end, ErrorCode::PollNotActive);
    // ensure counters won't underflow
    require!(candidate.votes > 0, ErrorCode::CandidateVotesUnderflow);
    require!(votes.active > 0, ErrorCode::VotesCounterUnderflow);
    require!(poll.votes > 0, ErrorCode::PollVotesUnderflow);

    // changing the poll counters
    candidate.votes-=1;
    poll.votes -=1;
    
    // changing the global counters
    votes.active-=1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(poll_id: u64, cid: u64)]
pub struct CloseVote<'info> {
    #[account(
        mut,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds=[b"candidate",
            poll_id.to_le_bytes().as_ref(),
            cid.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(
        mut,
        close=signer,
        seeds = [b"voter", poll_id.to_le_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(
        mut,
        seeds=[b"votes"],
        bump
    )]
    pub votes: Account<'info, Votes>,
    #[account(mut)]
    pub signer: Signer<'info>, 
}
