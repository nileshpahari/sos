//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
/// 
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    // TODO: Implement remove reaction functionality
    let tweet_accn = &mut ctx.accounts.tweet;
    let reaction_accn =  &mut ctx.accounts.tweet_reaction;
    match reaction_accn.reaction {
        ReactionType::Dislike => {
            if tweet_accn.dislikes==0 {
                return Err(TwitterError::MinDislikesReached.into())
            }
            tweet_accn.dislikes-=1;
        },
        ReactionType::Like =>{
            if tweet_accn.likes==0 {
                return Err(TwitterError::MinLikesReached.into())
            }
            tweet_accn.likes-=1;
        }
    }
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(mut, close = reaction_author, seeds=[TWEET_REACTION_SEED.as_bytes(), reaction_author.key().as_ref(), tweet_reaction.parent_tweet.key().as_ref()], bump=tweet_reaction.bump)]
    pub tweet_reaction: Account<'info, Reaction>,
    // #[account(mut, seeds=[tweet.topic.as_bytes(), TWEET_SEED.as_bytes(), tweet.tweet_author.key().as_ref()], bump=tweet.bump)]
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
