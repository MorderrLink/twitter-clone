import * as React from 'react';

type emailProps = {
    content:string;
    author:string | null | undefined;
    authorId:string | null | undefined;
}


export const EmailTemplate: React.FC<Readonly<emailProps>> = ({content, author, authorId}: emailProps) => (
    <div>
    <h1>Hello from Gambitter!</h1>
    <p>{author} posted a new Tweet! He says: ${content}. Check it out on https://twitter-clone-umber-rho.vercel.app/${authorId}</p>
  </div>
);
    
    