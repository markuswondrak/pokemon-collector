import { IconButton } from '@chakra-ui/react';
import { FaRobot } from 'react-icons/fa';

interface FloatingChatButtonProps {
	onClick: () => void;
}

export const FloatingChatButton = ({ onClick }: FloatingChatButtonProps) => {
	return (
		<IconButton
			aria-label="Open Chat"
			onClick={onClick}
			position="fixed"
			bottom="20px"
			right="20px"
			size="lg"
			colorPalette="blue"
			rounded="full"
			zIndex={9999}
			boxShadow="lg"
		>
			<FaRobot />
		</IconButton>
	);
};
