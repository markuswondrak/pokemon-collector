import { Button, Spinner, HStack, Text } from '@chakra-ui/react';
import { FaGoogle, FaSignOutAlt } from 'react-icons/fa';

interface AuthButtonProps {
	isAuthenticated: boolean;
	isLoading: boolean;
	onLogin: () => void;
	onLogout: () => void;
}

export const AuthButton = ({ isAuthenticated, isLoading, onLogin, onLogout }: AuthButtonProps) => {
	if (isLoading) {
		return (
			<Button variant="outline" colorPalette="gray" size="sm" disabled width="full">
				<Spinner size="sm" />
				<Text ml={2}>Loading...</Text>
			</Button>
		);
	}

	if (isAuthenticated) {
		return (
			<Button
				variant="outline"
				colorPalette="gray"
				size="sm"
				onClick={onLogout}
				width="full"
			>
				<HStack gap={2}>
					<FaSignOutAlt />
					<Text>Sign Out</Text>
				</HStack>
			</Button>
		);
	}

	return (
		<Button
			variant="solid"
			colorPalette="blue"
			size="sm"
			onClick={onLogin}
			width="full"
		>
			<HStack gap={2}>
				<FaGoogle />
				<Text>Sign in with Google</Text>
			</HStack>
		</Button>
	);
};
