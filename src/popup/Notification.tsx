import github, {GHNotification} from "../github";

const Notification = (props: GHNotification & { onOpen: (id: number) => void }) => {
    const open = () => {
        github.getUrl(props.subject.url).then((r) => {
            props.onOpen(props.id);
        });
    };

    return (
        <div className="notification" onClick={open}>
            <div className={"repo"}>{props.repository.full_name}</div>
            <div className={"title"}>{props.subject.title}</div>
        </div>
    );
};
export default Notification;
