import React from 'react';
import { format, isValid, parseISO } from 'date-fns';

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    commented_by: {
      personal_info: {
        profile_img = null,
        fullname = '',
        username = '',
      } = {},
    } = {},
    comment = '',
    commentedAt = '',
  } = commentData || {};

  let dateLabel = '';
  if (commentedAt) {
    let dateObj = null;
    if (isValid(new Date(commentedAt))) {
      dateObj = new Date(commentedAt);
    } else if (isValid(parseISO(commentedAt))) {
      dateObj = parseISO(commentedAt);
    }
    if (dateObj && isValid(dateObj)) {
      dateLabel = format(dateObj, 'dd MMM');
    }
  }

  return (
    <div className='w-full' style={{ paddingLeft: `${(leftVal || 0) * 10}px` }}>
      <div className="my-5 p-6 rounded-lg border border-gray">
        <div className="flex gap-3 items-center mb-8">
          {profile_img ? (
            <img src={profile_img} className='w-6 h-6 rounded-lg' alt={`${fullname}'s profile`} />
          ) : (
            <div className='w-6 h-6 rounded-lg bg-gray-300' aria-label="no profile image" />
          )}
          <p className='line-clamp-1'>
            {fullname} @{username}
          </p>
          <p className='min-w-fit'>{dateLabel}</p>
        </div>
        <p className='font-gelasio text-xl mb-3'>{comment}</p>
      </div>
    </div>
  );
};

export default CommentCard;
