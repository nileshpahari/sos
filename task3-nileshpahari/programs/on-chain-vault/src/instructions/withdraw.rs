//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", vault.vault_authority.as_ref()],
        bump,
        has_one = vault_authority,
        constraint = !vault.locked @ VaultError::VaultLocked
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = ctx.accounts.vault.to_account_info();
    let vault_authority  = ctx.accounts.vault_authority.to_account_info();

    if **vault.lamports.borrow() < amount {
        return Err(VaultError::InsufficientBalance.into());
    }
    vault.sub_lamports(amount)?;
    vault_authority.add_lamports(amount)?;
    emit!(WithdrawEvent {
        amount,
        vault_authority: *vault_authority.key,
        vault: *vault.key,
    });
    Ok(())
}