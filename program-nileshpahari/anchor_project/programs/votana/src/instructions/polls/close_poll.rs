use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::ErrorCode;

pub fn close_poll(ctx: Context<ClosePoll>, _poll_id: u64) -> Result<()> {
    let poll = &ctx.accounts.poll;
    let counter = &mut ctx.accounts.counter;
    let votes = &mut ctx.accounts.votes;
    let registrations = &mut ctx.accounts.registrations;
    require_keys_eq!(
        poll.creator,
        ctx.accounts.signer.key(),
        ErrorCode::Unauthorized
    );

    // changing the global counters
    counter.active=counter.active.saturating_sub(1);
    registrations.active=registrations.active.saturating_sub(poll.candidates);
    votes.active=votes.active.saturating_sub(poll.votes);

    Ok(())
}

#[derive(Accounts)]
#[instruction(_poll_id: u64)]
pub struct ClosePoll<'info> {
    #[account(
        mut,
        close = signer,
        seeds = [
            b"poll",
            _poll_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut, seeds = [b"counter"], bump)]
    pub counter: Account<'info, Counter>,
    #[account(
        mut,
        seeds=[b"votes"],
        bump
    )]
    pub votes: Account<'info, Votes>,
    #[account(
        mut,
        seeds=[b"registrations"],
        bump
    )]
    pub registrations: Account<'info, Registrations>,
    #[account(mut)]
    pub signer: Signer<'info>,
}
