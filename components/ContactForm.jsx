export default function ContactForm() {
    return (
        <>
            <form className="bg-gray-800 rounded px-10 py-6 w-[70%] md:w-[60%] md:mx-w-[350px] mx-auto">
                <h2 className="text-center text-white text-2xl font-bold my-3">Contact Form</h2>
                {/*  */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-7 mt-10">
                    <div className="input-field">
                        <label htmlFor="email">Email</label>
                        <input type="email" />
                    </div>
                    <div className="input-field">
                        <label htmlFor="organisation">Organisation (optional)</label>
                        <input type="text" />
                    </div>

                    <div className="input-field">
                        <label htmlFor="organisation">Organisation (optional)</label>
                        <input type="text" />
                    </div>

                    <div className="input-field">
                        <label htmlFor="phone">Phone</label>
                        <input type="text" />
                    </div>
                </div>
                    <div className="input-field">
                        <label htmlFor="message">Message</label>
                        <textarea className="w-full" id="ct-msg"></textarea>
                    </div>
                {/*  */}
                <button className="block w-[40%] text-gray-800 mt-5 bg-white rounded font-semibold text-md px-4 py-2 mx-auto">Submit</button>
            </form>
    </>)
}