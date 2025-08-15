//-------------------------------------------------------------------------------
///
/// TASK: Implement the add reaction functionality for the Twitter program
/// 
/// Requirements:
/// - Initialize a new reaction account with proper PDA seeds
/// - Increment the appropriate counter (likes or dislikes) on the tweet
/// - Set reaction fields: type, author, parent tweet, and bump
/// - Handle both Like and Dislike reaction types
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_reaction(ctx: Context<AddReactionContext>, reaction: ReactionType) -> Result<()> {
    // TODO: Implement add reaction functionality
    let reaction_accn = &mut ctx.accounts.tweet_reaction;
    let tweet_accn = &mut ctx.accounts.tweet;
    match reaction {
        ReactionType::Dislike=>{
            if tweet_accn.dislikes == u64::MAX {
                return Err(TwitterError::MaxDislikesReached.into());
            }
            tweet_accn.dislikes+=1;
        },
        ReactionType::Like=>{
            if tweet_accn.likes == u64::MAX {
                return Err(TwitterError::MaxLikesReached.into());
            }
            tweet_accn.likes+=1;
        }
    }
    reaction_accn.reaction_author=ctx.accounts.reaction_author.key();
    reaction_accn.parent_tweet=tweet_accn.key();
    reaction_accn.reaction=reaction;
    reaction_accn.bump=ctx.bumps.tweet_reaction;
    Ok(())
}

#[derive(Accounts)]
pub struct AddReactionContext<'info> {
    // TODO: Add required account constraints
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(init, payer=reaction_author, seeds=[TWEET_REACTION_SEED.as_bytes(), reaction_author.key().as_ref(), tweet.key().as_ref()], bump, space=8+Reaction::INIT_SPACE)]
    pub tweet_reaction: Account<'info, Reaction>,
    #[account(mut, seeds=[tweet.topic.as_bytes(), TWEET_SEED.as_bytes(), tweet.tweet_author.key().as_ref()], bump=tweet.bump)]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
