use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("7K7wfs7ofow8gD2S41bzqs9NWqojQAxdgXxrLahLTiUc");

#[program]
pub mod votana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        title: String,
        description: String,
        start: u64,
        end: u64,
        add_candidates: bool,
        withdraw_votes: bool,
        withdraw_candidates: bool,
    ) -> Result<()> {
        instructions::create_poll(ctx, title, description, start, end, add_candidates, withdraw_votes, withdraw_candidates)
    }

    pub fn close_poll(ctx: Context<ClosePoll>, poll_id: u64) -> Result<()> {
        instructions::close_poll(ctx, poll_id)
    }

    pub fn register_candidate(ctx: Context<RegisterCandidate>, poll_id: u64, name: String) -> Result<()> {
        instructions::register_candidate(ctx, poll_id, name)
    }

    pub fn unregister_candidate(ctx: Context<UnregisterCandidate>, poll_id: u64, cid: u64) -> Result<()> {
        instructions::unregister_candidate(ctx, poll_id, cid)
    }

    pub fn cast_vote(ctx: Context<CastVote>, poll_id: u64, cid: u64) -> Result<()> {
        instructions::cast_vote(ctx, poll_id, cid)
    }

    pub fn close_vote(ctx: Context<CloseVote>, poll_id: u64, cid: u64) -> Result<()> {
        instructions::close_vote(ctx, poll_id, cid)
    }
}
