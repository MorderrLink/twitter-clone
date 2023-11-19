import { useSession } from "next-auth/react";

import Button from "~/components/Button";

type FollowButtonProps = {
    onClick: () => void;
    isFollowing: boolean;
    isLoading: boolean;
    userId: string;
}

export default function FollowButton({isFollowing, isLoading, onClick, userId} : FollowButtonProps) {

    const session = useSession()
    if (session.status !== "authenticated" || session.data.user.id === userId) return null

    return <Button onClick={onClick} small gray={isFollowing} disabled={isLoading}>
        {isFollowing ? "Unfollow" : "Follow"}
    </Button>
}