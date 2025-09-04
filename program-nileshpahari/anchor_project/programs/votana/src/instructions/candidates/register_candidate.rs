use anchor_lang::prelude::*;
use crate::constants::*;
use crate::states::*;
use crate::errors::ErrorCode;

pub fn register_candidate(ctx: Context<RegisterCandidate>, poll_id: u64, name: String) -> Result<()> {
    require!(name.len() <= 32, ErrorCode::NameTooLong);

    let candidate = &mut ctx.accounts.candidate;
    let registrations = &mut ctx.accounts.registrations;
    let signer = &ctx.accounts.signer;
    let poll = &mut ctx.accounts.poll;

    let now = Clock::get()?.unix_timestamp as u64;

    require!(poll.end > now, ErrorCode::PollNotActive);

    require!(poll.id == poll_id, ErrorCode::PollDoesNotExist);
    
    if !poll.allow_candidate_adding {
        require_keys_eq!(poll.creator, signer.key(), ErrorCode::Unauthorized);
    }
    
    require!(candidate.has_registered == false, ErrorCode::CandidateAlreadyRegistered);

    // changing the global counters
    registrations.total = registrations.total.saturating_add(1);
    registrations.active = registrations.active.saturating_add(1);
    
    // changing the poll counters
    poll.candidates = poll.candidates.saturating_add(1);

    candidate.cid = registrations.total;
    candidate.poll_id = poll_id;
    candidate.creator = signer.key();
    candidate.has_registered = true;
    candidate.name = name;
    candidate.votes=0;

    Ok(())
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct RegisterCandidate<'info> {
    #[account(mut, seeds = [b"poll", poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,
    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Candidate::INIT_SPACE,
        seeds = [
            b"candidate".as_ref(),
            poll_id.to_le_bytes().as_ref(),
            (registrations.total + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    #[account(mut, seeds = [b"registrations"], bump)]
    pub registrations: Account<'info, Registrations>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}