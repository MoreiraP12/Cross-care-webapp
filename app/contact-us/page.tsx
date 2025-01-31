import ContactForm from "../components/ContactForm";

export default function ContactPage() {
    return (
        <div className="flex justify-center">
        <div className="px-4 sm:px-6 lg:px-8 w-full flex mt-6 justify-center ">
          <div className="bg-white rounded-lg shadow-lg  p-10 my-6 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-4xl sm:text-6xl font-bold"> Contact Us</h3>
            </div>
            <ContactForm />
            </div>
        </div>
      </div>

    );
}