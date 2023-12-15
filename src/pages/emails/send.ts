import type { NextApiResponse } from 'next';
import { EmailTemplate } from '~/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend("re_3wdu5nZw_HFC21osNiNhHe3rMDFftqP3t");

type emailProps = {
    content:string;
    author:string | null | undefined;
    authorId:string | null | undefined;
    userEmail: string | null;

    res: NextApiResponse;
}

export default async function({content, author, authorId, userEmail, res}: emailProps) {
  try {
    if (userEmail !== null) {
      const data = await resend.emails.send({
          from: 'gambitter@clown.com',
          to: [userEmail],
          subject: `New Tweet from ${author}`,
          react: EmailTemplate({author: author, authorId: authorId, content:content}),
          text: ``,
        });
        res.status(200).json(data);
    }
  } catch (error) {
    res.status(400).json(error);
  }
  
  

}