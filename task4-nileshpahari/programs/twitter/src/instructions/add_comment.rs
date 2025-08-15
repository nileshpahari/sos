//-------------------------------------------------------------------------------
///
/// TASK: Implement the add comment functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that comment content doesn't exceed maximum length
/// - Initialize a new comment account with proper PDA seeds
/// - Set comment fields: content, author, parent tweet, and bump
/// - Use content hash in PDA seeds for unique comment identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::errors::TwitterError;
use anchor_lang::solana_program::hash::hash;
use crate::states::*;

pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()> {
    if comment_content.len() > COMMENT_LENGTH {
        return Err(TwitterError::CommentTooLong.into());
    }
    let comment_accn = &mut ctx.accounts.comment;
    let comment = Comment {
        comment_author: ctx.accounts.comment_author.key(),
        content: comment_content,
        parent_tweet: ctx.accounts.tweet.key(),
        bump: ctx.bumps.comment
    };
    
    comment_accn.comment_author= comment.comment_author;
    comment_accn.content = comment.content;
    comment_accn.parent_tweet = comment.parent_tweet;
    comment_accn.bump=comment.bump;
    Ok(())
}

#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    // TODO: Add required account constraints
    #[account(mut)]
    pub comment_author: Signer<'info>,
    #[account(init, payer=comment_author, seeds=[COMMENT_SEED.as_bytes(), comment_author.key().as_ref(), {hash(comment_content.as_bytes()).to_bytes().as_ref()}, tweet.key().as_ref()],bump,space = 8 + Comment::INIT_SPACE)]
    pub comment: Account<'info, Comment>,
    #[account(seeds=[tweet.topic.as_bytes(), TWEET_SEED.as_bytes(), tweet.tweet_author.key().as_ref()], bump=tweet.bump)]
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
