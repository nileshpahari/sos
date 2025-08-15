//-------------------------------------------------------------------------------
///
/// TASK: Implement the initialize tweet functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that topic and content don't exceed maximum lengths
/// - Initialize a new tweet account with proper PDA seeds
/// - Set tweet fields: topic, content, author, likes, dislikes, and bump
/// - Initialize counters (likes and dislikes) to zero
/// - Use topic in PDA seeds for tweet identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn initialize_tweet(
    ctx: Context<InitializeTweet>,
    topic: String,
    content: String,
) -> Result<()> {
    // TODO: Implement initialize tweet functionality
    if topic.len()>TOPIC_LENGTH {
       return Err(TwitterError::TopicTooLong.into()); 
    }
    if content.len()>CONTENT_LENGTH {
        return Err(TwitterError::ContentTooLong.into());
    }
    let tweet_accn  = &mut ctx.accounts.tweet;
    let tweet= Tweet {
        bump: ctx.bumps.tweet,
        tweet_author: ctx.accounts.tweet_authority.key(),
        topic: topic,
        content: content,
        likes: 0,
        dislikes: 0
    };
    tweet_accn.bump=tweet.bump;
    tweet_accn.tweet_author=tweet.tweet_author;
    tweet_accn.topic=tweet.topic;
    tweet_accn.content=tweet.content;
    tweet_accn.likes=tweet.likes;
    tweet_accn.dislikes=tweet.dislikes;

    Ok(())
  
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct InitializeTweet<'info> {
    // TODO: Add required account constraints
    #[account(mut)]
    pub tweet_authority: Signer<'info>,
    #[account(init, payer=tweet_authority, seeds=[topic.as_bytes(), TWEET_SEED.as_bytes(), tweet_authority.key().as_ref()], bump, space=Tweet::INIT_SPACE)]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
