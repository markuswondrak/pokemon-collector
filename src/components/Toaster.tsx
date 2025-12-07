import { createToaster, Toaster as ChakraToaster, Toast, Stack } from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Toast.Root width={{ base: "full", md: "sm" }}>
          <Stack gap="1" flex="1" maxWidth="100%">
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
          </Stack>
          {toast.action && (
            <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
          )}
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </ChakraToaster>
  )
}
