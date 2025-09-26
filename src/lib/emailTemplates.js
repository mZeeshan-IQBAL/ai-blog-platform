// src/lib/emailTemplates.js

export const emailTemplates = {
  like: ({ fromUser, post, siteUrl = "http://localhost:3000" }) => ({
    subject: `${fromUser.name} liked your post`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Like Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .user-info { display: flex; align-items: center; margin-bottom: 20px; }
            .user-avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .button:hover { background: #5a67d8; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>👍 Someone liked your post!</h1>
          </div>
          <div class="content">
            <div class="user-info">
              ${fromUser.image ? `<img src="${fromUser.image}" alt="${fromUser.name}" class="user-avatar">` : ''}
              <div>
                <strong>${fromUser.name}</strong> liked your post!
              </div>
            </div>
            <div class="divider"></div>
            <h3>Your Post:</h3>
            <p><strong>"${post.title}"</strong></p>
            <a href="${siteUrl}/posts/${post._id}" class="button">View Post</a>
            <div class="divider"></div>
            <div class="footer">
              <p>This notification was sent from AI Blog Platform</p>
              <p><a href="${siteUrl}/settings">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  comment: ({ fromUser, post, comment, siteUrl = "http://localhost:3000" }) => ({
    subject: `${fromUser.name} commented on your post`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Comment Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .user-info { display: flex; align-items: center; margin-bottom: 20px; }
            .user-avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
            .comment-box { background: white; padding: 15px; border-left: 4px solid #48bb78; margin: 15px 0; border-radius: 4px; }
            .button { background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .button:hover { background: #38a169; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💬 New Comment on Your Post!</h1>
          </div>
          <div class="content">
            <div class="user-info">
              ${fromUser.image ? `<img src="${fromUser.image}" alt="${fromUser.name}" class="user-avatar">` : ''}
              <div>
                <strong>${fromUser.name}</strong> commented on your post
              </div>
            </div>
            <div class="divider"></div>
            <h3>Your Post:</h3>
            <p><strong>"${post.title}"</strong></p>
            <div class="comment-box">
              <strong>Comment:</strong><br>
              "${comment.content}"
            </div>
            <a href="${siteUrl}/posts/${post._id}#comments" class="button">View Comment</a>
            <div class="divider"></div>
            <div class="footer">
              <p>This notification was sent from AI Blog Platform</p>
              <p><a href="${siteUrl}/settings">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  bookmark: ({ fromUser, post, siteUrl = "http://localhost:3000" }) => ({
    subject: `${fromUser.name} bookmarked your post`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Bookmark Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .user-info { display: flex; align-items: center; margin-bottom: 20px; }
            .user-avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
            .button { background: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .button:hover { background: #dd6b20; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔖 Someone bookmarked your post!</h1>
          </div>
          <div class="content">
            <div class="user-info">
              ${fromUser.image ? `<img src="${fromUser.image}" alt="${fromUser.name}" class="user-avatar">` : ''}
              <div>
                <strong>${fromUser.name}</strong> saved your post to their bookmarks!
              </div>
            </div>
            <div class="divider"></div>
            <h3>Your Post:</h3>
            <p><strong>"${post.title}"</strong></p>
            <p>Your content was valuable enough for someone to save it for later reading. Great job!</p>
            <a href="${siteUrl}/posts/${post._id}" class="button">View Post</a>
            <div class="divider"></div>
            <div class="footer">
              <p>This notification was sent from AI Blog Platform</p>
              <p><a href="${siteUrl}/settings">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  follow: ({ fromUser, siteUrl = "http://localhost:3000" }) => ({
    subject: `${fromUser.name} started following you`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Follower Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .user-info { display: flex; align-items: center; margin-bottom: 20px; }
            .user-avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
            .button { background: #9f7aea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .button:hover { background: #805ad5; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>👥 You have a new follower!</h1>
          </div>
          <div class="content">
            <div class="user-info">
              ${fromUser.image ? `<img src="${fromUser.image}" alt="${fromUser.name}" class="user-avatar">` : ''}
              <div>
                <strong>${fromUser.name}</strong> started following you!
              </div>
            </div>
            <div class="divider"></div>
            <p>You have a new follower! They'll now see your latest posts in their feed and get notified about your new content.</p>
            <p>Why not check out their profile and consider following them back?</p>
            <a href="${siteUrl}/profile/${fromUser.id}" class="button">View Their Profile</a>
            <div class="divider"></div>
            <div class="footer">
              <p>This notification was sent from AI Blog Platform</p>
              <p><a href="${siteUrl}/settings">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};