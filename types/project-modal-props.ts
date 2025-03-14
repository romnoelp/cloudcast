export type CreateProjectModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    createProject: () => Promise<void>;
};