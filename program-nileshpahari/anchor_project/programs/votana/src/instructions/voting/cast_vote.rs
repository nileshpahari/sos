use crate::constants::*;
use crate::errors::ErrorCode;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn cast_vote(ctx: Context<CastVote>, poll_id: u64, cid: u64) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    let poll = &mut ctx.accounts.poll;
    let voter = &mut ctx.accounts.voter;
    let votes = &mut ctx.accounts.votes;
    let now = Clock::get()?.unix_timestamp as u64;

    require!(poll.id == poll_id, ErrorCode::PollDoesNotExist);

    if !candidate.has_registered || candidate.poll_id != poll_id {
        return Err(ErrorCode::CandidateNotRegistered.into());
    }
    if voter.has_voted {
        return Err(ErrorCode::VoterAlreadyVoted.into());
    }

    require!(
        poll.end > now,
        ErrorCode::PollNotActive
    );

    voter.cid= cid;
    voter.poll_id= poll_id;
    voter.has_voted=true;   

    // changing the poll counters
    candidate.votes = candidate.votes.saturating_add(1);
    poll.votes = poll.votes.saturating_add(1);
    
    // changing the global counters
    votes.total = votes.total.saturating_add(1);
    votes.active = votes.active.saturating_add(1);

    Ok(())
}

#[derive(Accounts)]
#[instruction(poll_id: u64, cid: u64)]
pub struct CastVote<'info> {
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
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Voter::INIT_SPACE, 
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
    pub system_program: Program<'info, System>,
}
