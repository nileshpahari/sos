//-------------------------------------------------------------------------------
///
/// TASK: Implement the deposit functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::DepositEvent;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump,
        constraint = !vault.locked @ VaultError::VaultLocked
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}


pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // TODO: Implement deposit functionality
    let user =  &mut ctx.accounts.user.to_account_info();
    let vault = &mut ctx.accounts.vault.to_account_info();
    if **user.lamports.borrow() < amount {
        return Err(VaultError::InsufficientBalance.into());
    }
    let ix =  transfer(&user.key(),&vault.key(), amount);
    invoke( &ix, &[user.clone(), vault.clone(), ctx.accounts.system_program.to_account_info().clone()])?;
    emit!(DepositEvent {
        amount, 
        user: user.key(),
        vault: vault.key()
    });
    Ok(())
}