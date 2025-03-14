export type CreateProjectModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, description: string) => Promise<void>;
};