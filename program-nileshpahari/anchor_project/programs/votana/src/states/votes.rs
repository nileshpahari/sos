
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Votes {
    pub total: u64,
    pub active: u64,
}
