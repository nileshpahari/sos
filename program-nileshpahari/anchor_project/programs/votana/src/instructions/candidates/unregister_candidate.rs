
use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::ErrorCode;

pub fn unregister_candidate(ctx: Context<UnregisterCandidate>, poll_id: u64, _cid: u64) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let candidate = &mut ctx.accounts.candidate;
    let registrations = &mut ctx.accounts.registrations;
    let votes = &mut ctx.accounts.votes;
    require!(poll.id == poll_id, ErrorCode::PollDoesNotExist);

    require_keys_eq!(
        candidate.creator,
        ctx.accounts.signer.key(),
        ErrorCode::Unauthorized
    );
    if !poll.allow_candidate_withdraw {
        require_keys_eq!(poll.creator, ctx.accounts.signer.key(), ErrorCode::Unauthorized);
    }

    // changing the poll counters
    poll.candidates = poll.candidates.saturating_sub(1);
    poll.votes = poll.votes.saturating_sub(candidate.votes);
    
    // changing the global counters
    registrations.active = registrations.active.saturating_sub(1);
    votes.active = votes.active.saturating_sub(candidate.votes);
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(poll_id: u64, _cid: u64)]
pub struct UnregisterCandidate<'info> {
    #[account(
        mut,
        close = signer,
        seeds = [
            b"candidate",
            poll_id.to_le_bytes().as_ref(),
            _cid.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    #[account(mut, seeds = [b"poll", poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,
    #[account(mut, seeds = [b"registrations"], bump)]
    pub registrations: Account<'info, Registrations>,
    #[account(mut, seeds = [b"votes"], bump)]
    pub votes: Account<'info, Votes>,
    #[account(mut)]
    pub signer: Signer<'info>,
}