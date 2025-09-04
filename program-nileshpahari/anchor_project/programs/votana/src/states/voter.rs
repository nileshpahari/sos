use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Voter {
    pub poll_id: u64,
    pub cid: u64,
    pub has_voted: bool,
}
