use crate::constants::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    let registrations = &mut ctx.accounts.registrations;
    let votes = &mut ctx.accounts.votes;
    counter.total = 0;
    counter.active = 0;
    registrations.total = 0;
    registrations.active = 0;
    votes.total = 0;
    votes.active = 0;
    msg!("Initialized");
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Counter::INIT_SPACE, seeds = [b"counter"], bump)]
    pub counter: Account<'info, Counter>,
    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Registrations::INIT_SPACE, seeds = [b"registrations"], bump)]
    pub registrations: Account<'info, Registrations>,
    #[account(init, payer = signer, space = ANCHOR_DISCRIMINATOR_SIZE + Votes::INIT_SPACE, seeds = [b"votes"], bump)]
    pub votes: Account<'info, Votes>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
