<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500">Terms and Condition </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">Terms and Condition</AppText>
      <div class="my-5">
        <AppText variant="16" font="300" hex="#282828" lineHeight="21px">
          <b>Acknowledgment</b>
          These are the Terms and Conditions governing the use of this Service and the agreement that operates
          between You and the Company. These Terms and Conditions set out the rights and obligations of all users
          regarding the use of the Service.
          Your access to and use of the Service is conditioned on Your acceptance of and compliance with these
          Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or
          use the Service.
          By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree
          with any part of these Terms and Conditions then You may not access the Service.
          You represent that you are over the age of 15. The Company does not permit those under 15 to use the
          Service.
          Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the
          Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection,
          use and disclosure of Your personal information when You use the Application or the Website and tells You
          about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before
          using Our Service.
          User Accounts
          When You create an account with Us, You must provide Us information that is accurate, complete, and
          current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate
          termination of Your account on Our Service.
          You are responsible for safeguarding the password that You use to access the Service and for any activities
          or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media
          Service.
          You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming
          aware of any breach of security or unauthorized use of Your account.
          You may not use as a username the name of another person or entity or that is not lawfully available for
          use, a name or trademark that is subject to any rights of another person or entity other than You without
          appropriate authorization, or a name that is otherwise offensive, vulgar or obscene.
          Content
          Your Right to Post Content
          Our Service allows You to post Content. You are responsible for the Content that You post to the Service,
          including its legality, reliability, and appropriateness.
          By posting Content to the Service, You grant Us the right and license to use, modify, publicly perform,
          publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all
          of Your rights to any Content You submit, post or display on or through the Service and You are responsible
          for protecting those rights. You agree that this license includes the right for Us to make Your Content
          available to other users of the Service, who may also use Your Content subject to these Terms.
          You represent and warrant that: (i) the Content is Yours (You own it) or You have the right to use it and
          grant Us the rights and license as provided in these Terms, and (ii) the posting of Your Content on or
          through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any
          other rights of any person.
          Content Restrictions
          The Company is not responsible for the content of the Service's users. You expressly understand and
          agree that You are solely responsible for the Content and for all activity that occurs under your account,
          whether done so by You or any third person using Your account.
          You may not transmit any Content that is unlawful, offensive, upsetting, intended to disgust, threatening,
          libelous, defamatory, obscene or otherwise objectionable. Examples of such objectionable Content include,
          but are not limited to, the following:
          <ul class="p-2">
            <li class="my-2"> ● Unlawful or promoting unlawful activity.</li>
            <li class="my-2"> ● Defamatory, discriminatory, or mean-spirited content, including references or commentary about
              religion, race, sexual orientation, gender, national/ethnic origin, or other targeted groups.</li>
            <li class="my-2"> ● Spam, machine – or randomly – generated, constituting unauthorized or unsolicited advertising,
              chain letters, any other form of unauthorized solicitation, or any form of lottery or gambling.</li>
            <li class="my-2">
              ● Containing or installing any viruses, worms, malware, trojan horses, or other content that is
              designed or intended to disrupt, damage, or limit the functioning of any software, hardware or
              telecommunications equipment or to damage or obtain unauthorized access to any data or other
              information of a third person.
            </li>
            <li class="my-2">
              ● Infringing on any proprietary rights of any party, including patent, trademark, trade secret, copyright,
              right of publicity or other rights.
            </li>
            <li class="my-2">
              ● Impersonating any person or entity including the Company and its employees or representatives.
            </li>
            <li class="my-2">
              ● Violating the privacy of any third person.
            </li>
            <li class="my-2">
              ● False information and features.
            </li>
          </ul>
          The Company reserves the right, but not the obligation, to, in its sole discretion, determine whether or not
          any Content is appropriate and complies with this Terms, refuse or remove this Content. The Company
          further reserves the right to make formatting and edits and change the manner of any Content. The
          Company can also limit or revoke the use of the Service if You post such objectionable Content. As the
          Company cannot control all content posted by users and/or third parties on the Service, you agree to use
          the Service at your own risk. You understand that by using the Service You may be exposed to content that
          You may find offensive, indecent, incorrect or objectionable, and You agree that under no circumstances will
          the Company be liable in any way for any content, including any errors or omissions in any content, or any
          loss or damage of any kind incurred as a result of your use of any content.
          Content Backups
          Although regular backups of Content are performed, the Company does not guarantee there will be no loss
          or corruption of data.
          Corrupt or invalid backup points may be caused by, without limitation, Content that is corrupted prior to
          being backed up or that changes during the time a backup is performed.
          The Company will provide support and attempt to troubleshoot any known or discovered issues that may
          affect the backups of Content. But You acknowledge that the Company has no liability related to the
          integrity of Content or the failure to successfully restore Content to a usable state.
          You agree to maintain a complete and accurate copy of any Content in a location independent of the
          Service.
        </AppText>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "account-term_condition",
  components: { AppText },
  computed: {
    path() {
      let path = this.$route.path;
      return path;
    },
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    to() {
      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
